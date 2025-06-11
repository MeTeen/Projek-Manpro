require('dotenv').config();
const { Client } = require('pg');

async function createTicketsTable() {  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'crm_db',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create ENUM types if they don't exist
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_category AS ENUM ('Delivery', 'Product Quality', 'Payment', 'General', 'Refund', 'Exchange');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
        "purchaseId" INTEGER REFERENCES customer_products(id) ON DELETE SET NULL ON UPDATE CASCADE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ticket_status NOT NULL DEFAULT 'Open',
        priority ticket_priority NOT NULL DEFAULT 'Medium',
        category ticket_category NOT NULL,
        "assignedTo" INTEGER REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE,
        resolution TEXT,
        "attachmentUrls" JSON,
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets("customerId");');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets("assignedTo");');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets("createdAt");');

    // Mark migration as completed
    await client.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20250611000000-create-tickets-table.js') 
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('Tickets table created successfully!');
  } catch (error) {
    console.error('Error creating tickets table:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTicketsTable();
