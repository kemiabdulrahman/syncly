import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telemedicine Platform API',
      version: '1.0.0',
      description: 'A comprehensive real-time telemedicine platform API for healthcare workers to collaborate on patient cases, share medical records, and coordinate emergency responses.',
      contact: {
        name: 'API Support',
        email: 'support@telemedicine.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.telemedicine.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        // Authentication Schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role', 'licenseNumber', 'phoneNumber'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'doctor@hospital.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123!'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['doctor', 'nurse', 'admin', 'specialist', 'paramedic'],
              example: 'doctor'
            },
            specialization: {
              type: 'string',
              example: 'Cardiology'
            },
            licenseNumber: {
              type: 'string',
              example: 'MD-123456'
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890'
            },
            department: {
              type: 'string',
              example: 'Emergency Medicine'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'doctor@hospital.com'
            },
            password: {
              type: 'string',
              example: 'SecurePassword123!'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/HealthcareWorker'
            }
          }
        },

        // User Schemas
        HealthcareWorker: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'doctor@hospital.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['doctor', 'nurse', 'admin', 'specialist', 'paramedic'],
              example: 'doctor'
            },
            specialization: {
              type: 'string',
              example: 'Cardiology'
            },
            licenseNumber: {
              type: 'string',
              example: 'MD-123456'
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890'
            },
            department: {
              type: 'string',
              example: 'Emergency Medicine'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastActive: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Patient Schemas
        Patient: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            patientId: {
              type: 'string',
              example: 'PT-2024-001'
            },
            firstName: {
              type: 'string',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              example: 'Smith'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-05-15'
            },
            gender: {
              type: 'string',
              example: 'Female'
            },
            bloodType: {
              type: 'string',
              example: 'O+'
            },
            allergies: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Penicillin', 'Peanuts']
            },
            chronicConditions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Diabetes Type 2', 'Hypertension']
            },
            emergencyContact: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'John Smith'
                },
                relationship: {
                  type: 'string',
                  example: 'Spouse'
                },
                phoneNumber: {
                  type: 'string',
                  example: '+1234567890'
                }
              }
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CreatePatientRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
          properties: {
            firstName: {
              type: 'string',
              example: 'Jane'
            },
            lastName: {
              type: 'string',
              example: 'Smith'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-05-15'
            },
            gender: {
              type: 'string',
              example: 'Female'
            },
            bloodType: {
              type: 'string',
              example: 'O+'
            },
            allergies: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Penicillin']
            },
            chronicConditions: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Diabetes Type 2']
            },
            emergencyContact: {
              type: 'object',
              required: ['name', 'relationship', 'phoneNumber'],
              properties: {
                name: {
                  type: 'string',
                  example: 'John Smith'
                },
                relationship: {
                  type: 'string',
                  example: 'Spouse'
                },
                phoneNumber: {
                  type: 'string',
                  example: '+1234567890'
                }
              }
            }
          }
        },

        // Case Schemas
        Case: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            caseId: {
              type: 'string',
              example: 'CASE-2024-001'
            },
            patient: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            assignedTo: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['507f1f77bcf86cd799439011']
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Chest Pain Evaluation'
            },
            description: {
              type: 'string',
              example: 'Patient presenting with acute chest pain'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'pending_referral', 'resolved', 'closed'],
              example: 'in_progress'
            },
            priority: {
              type: 'string',
              enum: ['emergency', 'urgent', 'routine', 'low'],
              example: 'urgent'
            },
            symptoms: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Chest pain', 'Shortness of breath']
            },
            diagnosis: {
              type: 'string',
              example: 'Angina Pectoris'
            },
            treatment: {
              type: 'string',
              example: 'Prescribed nitrates and referred to cardiology'
            },
            notes: {
              type: 'string',
              example: 'Patient stable, monitoring required'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string'
                  },
                  url: {
                    type: 'string'
                  },
                  uploadedBy: {
                    type: 'string'
                  },
                  uploadedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CreateCaseRequest: {
          type: 'object',
          required: ['patient', 'title', 'description', 'priority'],
          properties: {
            patient: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Chest Pain Evaluation'
            },
            description: {
              type: 'string',
              example: 'Patient presenting with acute chest pain'
            },
            priority: {
              type: 'string',
              enum: ['emergency', 'urgent', 'routine', 'low'],
              example: 'urgent'
            },
            symptoms: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Chest pain', 'Shortness of breath']
            },
            assignedTo: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['507f1f77bcf86cd799439011']
            }
          }
        },

        // Medical Record Schemas
        MedicalRecord: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            recordId: {
              type: 'string',
              example: 'MR-2024-001'
            },
            patient: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            case: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            recordType: {
              type: 'string',
              example: 'Lab Result'
            },
            title: {
              type: 'string',
              example: 'Blood Test Results'
            },
            content: {
              type: 'string',
              example: 'Complete blood count results...'
            },
            encryptedData: {
              type: 'string'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string'
                  },
                  url: {
                    type: 'string'
                  },
                  encryptedUrl: {
                    type: 'string'
                  }
                }
              }
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            accessControl: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: {
                    type: 'string'
                  },
                  accessLevel: {
                    type: 'string',
                    enum: ['owner', 'shared_full', 'shared_limited', 'emergency']
                  },
                  grantedBy: {
                    type: 'string'
                  },
                  grantedAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Referral Schemas
        Referral: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            referralId: {
              type: 'string',
              example: 'REF-2024-001'
            },
            case: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            patient: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            fromProvider: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            toProvider: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            reason: {
              type: 'string',
              example: 'Specialist consultation required for cardiology'
            },
            urgency: {
              type: 'string',
              enum: ['emergency', 'urgent', 'routine', 'low'],
              example: 'urgent'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'completed'],
              example: 'pending'
            },
            notes: {
              type: 'string'
            },
            responseNotes: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            respondedAt: {
              type: 'string',
              format: 'date-time'
            },
            completedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Emergency Alert Schemas
        EmergencyAlert: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            alertId: {
              type: 'string',
              example: 'EMRG-2024-001'
            },
            title: {
              type: 'string',
              example: 'Code Blue - Room 302'
            },
            description: {
              type: 'string',
              example: 'Cardiac arrest in progress'
            },
            location: {
              type: 'string',
              example: 'ICU Room 302'
            },
            priority: {
              type: 'string',
              enum: ['emergency', 'urgent', 'routine', 'low'],
              example: 'emergency'
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            assignedTo: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            respondedBy: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            status: {
              type: 'string',
              enum: ['active', 'responding', 'resolved'],
              example: 'active'
            },
            case: {
              type: 'string'
            },
            patient: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            resolvedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Error Response
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            },
            details: {
              type: 'string'
            }
          }
        },

        // Success Response
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/swagger/paths/*.ts', './src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
