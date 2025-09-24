# KMRL Document Management System - AI API Documentation

## Overview
This document provides detailed information about the AI services available in the KMRL Document Management System. These services offer advanced document processing, analysis, and management capabilities.

## Base URL
```
http://localhost:3000/api/ai
```

## Authentication
All AI API endpoints require authentication through the existing user session system. No additional API keys are needed for internal use.

## 🔍 Document Understanding & Processing

### Extract Text from Document
Extract text content from various document types including PDFs, images, and text files.

**Endpoint:** `POST /extract-text`
**Request Body:**
```json
{
  "filePath": "/path/to/document.pdf"
}
```
**Response:**
```json
{
  "success": true,
  "extractedText": "Extracted text content...",
  "wordCount": 1250,
  "characterCount": 7500
}
```

### Detect and Translate Language
Auto-detect document language and translate between English and Malayalam.

**Endpoint:** `POST /detect-translate`
**Request Body:**
```json
{
  "text": "Document content in English or Malayalam"
}
```
**Response:**
```json
{
  "success": true,
  "detectedLanguage": "English",
  "translatedText": "അനുവാദിച്ച മലയാളം ഉള്ളടക്കം...",
  "confidence": 0.92
}
```

### Classify Document
Automatically categorize documents into predefined categories.

**Endpoint:** `POST /classify-document`
**Request Body:**
```json
{
  "text": "Document content to classify"
}
```
**Response:**
```json
{
  "success": true,
  "category": "Engineering",
  "confidence": 0.87,
  "tags": ["design", "technical", "blueprint"]
}
```

### Extract Entities
Identify and extract key entities from document content.

**Endpoint:** `POST /extract-entities`
**Request Body:**
```json
{
  "text": "Document content with entities to extract"
}
```
**Response:**
```json
{
  "success": true,
  "entities": {
    "dates": ["12/25/2023", "01/15/2024"],
    "names": ["John Smith", "Mary Johnson"],
    "amounts": ["₹50,000", "Rs.25,000"],
    "regulations": ["ISO 9001", "KMRL-2023"],
    "projectIds": ["PRJ-12345", "KMRL-789"]
  }
}
```

### Compare Document Versions
Highlight differences between two versions of a document.

**Endpoint:** `POST /compare-versions`
**Request Body:**
```json
{
  "document1": "First version content",
  "document2": "Second version content"
}
```
**Response:**
```json
{
  "success": true,
  "changes": [
    {
      "type": "added",
      "content": "New section about safety protocols",
      "line": 15
    },
    {
      "type": "modified",
      "content": "Line changed from: \"Budget: ₹100,000\" to: \"Budget: ₹150,000\"",
      "line": 22
    }
  ],
  "summary": "Document comparison found 5 changes.",
  "similarity": 0.82
}
```

## 📑 Summarization & Knowledge Extraction

### Summarize Document
Create concise summaries of lengthy documents.

**Endpoint:** `POST /summarize`
**Request Body:**
```json
{
  "text": "Long document content to summarize"
}
```
**Response:**
```json
{
  "success": true,
  "summary": "Document contains important information...",
  "bulletPoints": [
    "First key point from the document",
    "Second key point from the document",
    "Third key point from the document"
  ],
  "wordCount": 2500,
  "sentenceCount": 120
}
```

### Extract Action Points
Identify tasks, deadlines, and responsibilities from documents.

**Endpoint:** `POST /extract-action-points`
**Request Body:**
```json
{
  "text": "Document content with action items"
}
```
**Response:**
```json
{
  "success": true,
  "actionPoints": [
    {
      "task": "Complete safety training by December 31st",
      "deadline": "12/31/2023",
      "priority": "High",
      "assignedTo": "John Smith"
    }
  ]
}
```

### Highlight Compliance
Identify compliance-related content and regulatory requirements.

**Endpoint:** `POST /highlight-compliance`
**Request Body:**
```json
{
  "text": "Document content with compliance information"
}
```
**Response:**
```json
{
  "success": true,
  "complianceIssues": [
    {
      "issue": "All employees must complete safety training annually",
      "type": "Safety",
      "severity": "High"
    }
  ]
}
```

### Extract Key-Value Pairs
Extract structured data from documents.

**Endpoint:** `POST /extract-key-value`
**Request Body:**
```json
{
  "text": "Document content with structured data"
}
```
**Response:**
```json
{
  "success": true,
  "keyValuePairs": {
    "invoice_number": "INV-2023-001",
    "vendor": "ABC Supplies Pvt. Ltd.",
    "cost": "50,000",
    "po_number": "PO-78945",
    "date": "12/01/2023"
  }
}
```

## 🔎 Search & Retrieval

### Semantic Search
Find documents based on meaning rather than keywords.

**Endpoint:** `POST /semantic-search`
**Request Body:**
```json
{
  "query": "Find last month's maintenance reports for Aluva station"
}
```
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc123",
      "title": "Aluva Station Maintenance Report - November 2023",
      "category": "Engineering",
      "relevance": 0.92
    }
  ],
  "resultCount": 15
}
```

### Multilingual Search
Search documents in English with results from Malayalam documents too.

**Endpoint:** `POST /multilingual-search`
**Request Body:**
```json
{
  "query": "പരിപാലന റിപ്പോർട്ട്" // "Maintenance Report" in Malayalam
}
```
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc456",
      "title": "Maintenance Report - December 2023",
      "category": "Engineering",
      "relevance": 0.87
    }
  ],
  "resultCount": 8
}
```

### Find Related Documents
Discover documents connected to a specific document.

**Endpoint:** `POST /find-related`
**Request Body:**
```json
{
  "documentId": "doc123"
}
```
**Response:**
```json
{
  "success": true,
  "relatedDocuments": [
    {
      "id": "doc456",
      "title": "Aluva Station Maintenance Budget",
      "similarity": 0.78
    }
  ]
}
```

### Visual Search
Retrieve drawings or diagrams by visual similarity.

**Endpoint:** `POST /visual-search`
**Request Body:**
```json
{
  "queryImage": "/path/to/query/image.jpg"
}
```
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc789",
      "title": "Aluva Station Blueprint",
      "similarity": 0.85
    }
  ],
  "resultCount": 3
}
```

## ⚡ Personalization & Notifications

### Get Role-Based Recommendations
Receive document recommendations based on user role.

**Endpoint:** `POST /recommendations`
**Request Body:**
```json
{
  "user": {
    "id": "user123",
    "role": "manager",
    "department": "Engineering"
  }
}
```
**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "doc123",
      "title": "Engineering Department Report",
      "category": "Engineering"
    }
  ],
  "recommendationCount": 12
}
```

### Get Priority Alerts
Receive notifications about urgent documents.

**Endpoint:** `GET /priority-alerts`
**Response:**
```json
{
  "success": true,
  "alerts": [
    {
      "id": "doc456",
      "title": "Safety Protocol Update",
      "alertLevel": "High",
      "reason": "Safety-related document"
    }
  ],
  "alertCount": 5
}
```

### Get Digest
Receive daily or weekly document summaries.

**Endpoint:** `POST /digest`
**Request Body:**
```json
{
  "user": {
    "id": "user123",
    "role": "staff",
    "department": "HR"
  },
  "period": "daily" // or "weekly"
}
```
**Response:**
```json
{
  "success": true,
  "digest": {
    "period": "daily",
    "generatedAt": "2023-12-01T09:00:00Z",
    "totalDocuments": 8,
    "categories": {
      "HR": [
        {
          "id": "doc789",
          "title": "New HR Policy Document"
        }
      ]
    },
    "highlights": [
      {
        "id": "doc789",
        "title": "New HR Policy Document"
      }
    ]
  }
}
```

## 🛡️ Trust, Security & Compliance

### Get Traceability Info
Get detailed traceability information for a document.

**Endpoint:** `POST /traceability`
**Request Body:**
```json
{
  "documentId": "doc123"
}
```
**Response:**
```json
{
  "success": true,
  "traceabilityInfo": {
    "documentId": "doc123",
    "originalSource": "Uploaded by user",
    "processingSteps": [
      {
        "step": "Upload",
        "timestamp": "2023-12-01T08:00:00Z"
      },
      {
        "step": "OCR Processing",
        "timestamp": "2023-12-01T08:05:00Z"
      }
    ],
    "checksum": "a1b2c3d4",
    "version": 1
  }
}
```

### Check Access Control
Verify if a user has access to a specific document.

**Endpoint:** `POST /access-control`
**Request Body:**
```json
{
  "user": {
    "id": "user123",
    "role": "staff",
    "name": "John Smith"
  },
  "documentId": "doc123"
}
```
**Response:**
```json
{
  "success": true,
  "allowed": true,
  "reason": "Document owner"
}
```

### Detect Anomalies
Identify duplicate documents, inconsistent data, or missing approvals.

**Endpoint:** `GET /anomalies`
**Response:**
```json
{
  "success": true,
  "anomalies": [
    {
      "type": "duplicate",
      "documentId": "doc123",
      "duplicateOf": "doc456",
      "severity": "Medium",
      "details": "Document appears to be a duplicate"
    }
  ],
  "anomalyCount": 3
}
```

## 📊 Analytics & Insights

### Analyze Trends
Get insights on recurring issues and document trends.

**Endpoint:** `GET /trends`
**Response:**
```json
{
  "success": true,
  "trends": {
    "categoryDistribution": [
      {
        "category": "Engineering",
        "count": 45
      }
    ],
    "uploadFrequency": [
      {
        "month": "2023-11",
        "count": 28
      }
    ],
    "commonIssues": [
      {
        "issue": "safety",
        "count": 12
      }
    ],
    "departmentActivity": [
      {
        "department": "Engineering",
        "documentCount": 45
      }
    ]
  }
}
```

### Build Knowledge Base
Create a knowledge base from processed documents.

**Endpoint:** `GET /knowledge-base`
**Response:**
```json
{
  "success": true,
  "knowledgeBase": {
    "categories": {
      "Engineering": {
        "documentCount": 45,
        "commonTags": {
          "design": 22,
          "technical": 18
        },
        "keyEntities": {}
      }
    },
    "commonPhrases": {
      "maintenance": 35,
      "safety": 28
    },
    "bestPractices": [],
    "lessonsLearned": []
  }
}
```

### Get Usage Insights
Track document access patterns and team workloads.

**Endpoint:** `GET /usage-insights`
**Response:**
```json
{
  "success": true,
  "insights": {
    "mostAccessed": [
      {
        "documentId": "doc123",
        "title": "Safety Protocol Document",
        "accessCount": 42
      }
    ],
    "departmentWorkload": [
      {
        "department": "Engineering",
        "documentCount": 45
      }
    ],
    "processingTimes": {
      "average": 120,
      "min": 45,
      "max": 320
    },
    "userEngagement": {
      "totalInteractions": 127,
      "interactionTypes": {
        "view": 89,
        "download": 38
      },
      "activeUserCount": 24,
      "peakHours": {
        "9": 25,
        "10": 32
      }
    }
  }
}
```

## Batch Processing

### Process Document Batch
Process multiple documents with all AI features at once.

**Endpoint:** `POST /process-batch`
**Request Body:**
```json
{
  "documentIds": ["doc123", "doc456", "doc789"]
}
```
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc123",
      "success": true,
      "classification": {
        "category": "Engineering",
        "confidence": 0.87
      },
      "entities": {
        "dates": ["12/25/2023"]
      },
      "summary": {
        "wordCount": 1250
      },
      "actionPoints": 3
    }
  ],
  "processedCount": 3,
  "errorCount": 0
}
```

## Error Handling
All API endpoints follow standard HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `404` - Not Found (document not found)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message describing the issue"
}
```

## Integration Examples

### JavaScript Frontend Integration
```javascript
// Summarize document content
async function summarizeDocument(content) {
  try {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.summary;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Summarization failed:', error);
    throw error;
  }
}
```

### Python Backend Integration
```python
import requests

def classify_document(content):
    url = "http://localhost:3000/api/ai/classify-document"
    payload = {"text": content}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Classification failed: {response.text}")
```