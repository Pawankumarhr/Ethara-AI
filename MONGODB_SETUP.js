/**
 * MONGODB SETUP FOR ETHARA AI
 * 
 * Copy and paste these commands into:
 * - MongoDB Compass (Query tab)
 * - OR mongosh shell
 * 
 * Database: ethara-ai
 */

// ============================================================
// STEP 1: Create users collection
// ============================================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name", "role"],
      properties: {
        _id: { bsonType: "objectId" },
        email: {
          bsonType: "string",
          description: "User email (unique)"
        },
        password: {
          bsonType: "string",
          description: "Hashed password"
        },
        name: {
          bsonType: "string",
          description: "User full name"
        },
        role: {
          bsonType: "string",
          enum: ["Admin", "Member"],
          description: "User role"
        },
        signup_timestamp: {
          bsonType: "date",
          description: "Account creation date"
        },
        last_login: {
          bsonType: "date",
          description: "Last login timestamp"
        },
        created_at: {
          bsonType: "date",
          description: "Record creation date"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

// Create indexes for users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ created_at: 1 });
db.users.createIndex({ last_login: 1 });

print("✓ users collection created with indexes");

// ============================================================
// STEP 2: Create projects collection
// ============================================================
db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "created_by"],
      properties: {
        _id: { bsonType: "objectId" },
        title: {
          bsonType: "string",
          description: "Project name"
        },
        description: {
          bsonType: "string",
          description: "Project description"
        },
        created_by: {
          bsonType: "objectId",
          description: "User ID of creator (reference to users)"
        },
        Members: {
          bsonType: "array",
          description: "Array of project Members",
          items: {
            bsonType: "object",
            required: ["user_id"],
            properties: {
              user_id: {
                bsonType: "objectId",
                description: "Member user ID (reference to users)"
              },
              joined_at: {
                bsonType: "date",
                description: "When Member joined"
              }
            }
          }
        },
        created_at: {
          bsonType: "date",
          description: "Record creation date"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

// Create indexes for projects
db.projects.createIndex({ created_by: 1 });
db.projects.createIndex({ created_at: 1 });
db.projects.createIndex({ "Members.user_id": 1 });

print("✓ projects collection created with indexes");

// ============================================================
// STEP 3: Create tasks collection
// ============================================================
db.createCollection("tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "project_id"],
      properties: {
        _id: { bsonType: "objectId" },
        title: {
          bsonType: "string",
          description: "Task title"
        },
        description: {
          bsonType: "string",
          description: "Task description"
        },
        status: {
          bsonType: "string",
          enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
          description: "Task status"
        },
        priority: {
          bsonType: "string",
          enum: ["LOW", "MEDIUM", "HIGH"],
          description: "Task priority"
        },
        assigned_to: {
          bsonType: "objectId",
          description: "User ID of assignee (reference to users)"
        },
        project_id: {
          bsonType: "objectId",
          description: "Project ID (reference to projects)"
        },
        due_date: {
          bsonType: "date",
          description: "Task due date"
        },
        created_at: {
          bsonType: "date",
          description: "Record creation date"
        },
        updated_at: {
          bsonType: "date",
          description: "Last update date"
        }
      }
    }
  }
});

// Create indexes for tasks
db.tasks.createIndex({ project_id: 1 });
db.tasks.createIndex({ assigned_to: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ due_date: 1 });
db.tasks.createIndex({ created_at: 1 });

print("✓ tasks collection created with indexes");

// ============================================================
// VERIFICATION
// ============================================================
print("\n✅ All collections created successfully!");
print("\nCollections in database:");
db.getCollectionNames().forEach(name => {
  const count = db[name].countDocuments();
  print(`  - ${name} (${count} documents)`);
});

print("\nIndexes created:");
print("  users: email (unique), created_at, last_login");
print("  projects: created_by, created_at, Members.user_id");
print("  tasks: project_id, assigned_to, status, due_date, created_at");
