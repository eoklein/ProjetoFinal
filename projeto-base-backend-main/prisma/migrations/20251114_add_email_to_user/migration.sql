-- AlterTable: Add email field to User table
ALTER TABLE "User" ADD COLUMN "email" TEXT;

-- CreateIndex: Add index on email for performance
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex: Add index on username for performance  
CREATE INDEX "User_username_idx" ON "User"("username");

-- Add index on email for performance
CREATE INDEX "User_email_idx" ON "User"("email");
