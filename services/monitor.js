const TenderScraper = require('./scraper');
const Tender = require('../models/Tender');
const Portal = require('../models/Portal');
const Notification = require('../models/Notification');
const { io } = require('../server');

class PortalMonitor {
    constructor() {
        this.scraper = new TenderScraper();
        this.monitoringActive = false;
        this.monitoringInterval = 60; // minutes
        this.timer = null;
    }

    async startMonitoring() {
        if (this.monitoringActive) return;

        this.monitoringActive = true;
        console.log('Portal monitoring started');

        // Initial scan
        await this.performScan();

        // Schedule periodic scans
        this.timer = setInterval(async () => {
            await this.performScan();
        }, this.monitoringInterval * 60 * 1000);
    }

    stopMonitoring() {
        this.monitoringActive = false;

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        console.log('Portal monitoring stopped');
    }

    async performScan() {
        console.log('Starting portal scan...');
        const startTime = new Date();

        const activePortals = await Portal.find({ active: true });
        const scanPromises = activePortals.map(portal => this.scanPortal(portal));

        try {
            const results = await Promise.allSettled(scanPromises);
            await this.processScanResults(results, activePortals, startTime);
        } catch (error) {
            console.error('Error during portal scan:', error);
        }
    }

    async scanPortal(portal) {
        try {
            console.log(`Scanning ${portal.name}...`);

            // Scrape the portal
            const tenders = await this.scraper.scrapePortal(portal);

            // Update portal stats
            portal.lastScanned = new Date();
            portal.totalTenders = tenders.length;

            // Check for new tenders
            const newTenders = await this.identifyNewTenders(tenders, portal._id);
            portal.newTenders = newTenders.length;

            // Save portal updates
            await portal.save();

            // Process new tenders
            if (newTenders.length > 0) {
                await this.processNewTenders(newTenders, portal);
            }

            return {
                portal: portal,
                tenders: tenders,
                newTenders: newTenders,
                success: true
            };

        } catch (error) {
            console.error(`Error scanning ${portal.name}:`, error);
            return {
                portal: portal,
                error: error,
                success: false
            };
        }
    }

    async identifyNewTenders(tenders, portalId) {
        // Get previously found tenders for this portal
        const existingTenders = await Tender.find({ portalId: portalId.toString() });
        const existingIds = existingTenders.map(t => t.id);

        // Find new tenders
        const newTenders = tenders.filter(tender => !existingIds.includes(tender.id));

        // Save new tenders to database
        for (const tender of newTenders) {
            const tenderModel = new Tender(tender);
            await tenderModel.save();
        }

        return newTenders;
    }

    async processNewTenders(newTenders, portal) {
        // Create notifications for new tenders
        for (const tender of newTenders) {
            const notification = new Notification({
                type: 'new-tender',
                title: 'New Tender Found',
                message: `${tender.title} found on ${portal.name}`,
                category: 'tender',
                priority: tender.priority,
                channels: ['dashboard', 'email'],
                data: {
                    tenderId: tender.id,
                    portalId: portal.id,
                    portalName: portal.name,
                    tenderData: tender
                },
                created: new Date(),
                read: false
            });

            await notification.save();

            // Emit real-time notification
            if (io) {
                io.emit('new-tender', tender);
                io.emit('new-notification', notification);
            }
        }
    }

    async processScanResults(results, portals, startTime) {
        let totalNewTenders = 0;
        let successfulScans = 0;
        let failedScans = 0;

        results.forEach((result, index) => {
            const portal = portals[index];

            if (result.status === 'fulfilled' && result.value.success) {
                successfulScans++;
                totalNewTenders += result.value.newTenders.length;
            } else {
                failedScans++;
                console.error(`Failed to scan ${portal.name}:`, result.reason || result.value.error);
            }
        });

        const endTime = new Date();
        const duration = (endTime - startTime) / 1000; // in seconds

        // Create summary notification if new tenders found
        if (totalNewTenders > 0) {
            const notification = new Notification({
                type: 'scan-summary',
                title: 'Portal Scan Complete',
                message: `Found ${totalNewTenders} new tender(s) across ${successfulScans} portal(s)`,
                category: 'system',
                priority: 'medium',
                channels: ['dashboard'],
                data: {
                    totalNewTenders,
                    successfulScans,
                    failedScans,
                    scanTime: startTime,
                    duration: duration
                },
                created: new Date(),
                read: false
            });

            await notification.save();

            // Emit real-time notification
            if (io) {
                io.emit('new-notification', notification);
            }
        }

        // Update scan statistics
        await this.updateScanStatistics({
            totalNewTenders,
            successfulScans,
            failedScans,
            scanTime: startTime,
            duration: duration
        });

        console.log(`Portal scan completed in ${duration} seconds. Found ${totalNewTenders} new tenders.`);
    }

    async updateScanStatistics(stats) {
        // Store scan statistics in a separate collection or file
        // For now, we'll just log them
        console.log('Scan statistics:', stats);
    }
}

module.exports = PortalMonitor;