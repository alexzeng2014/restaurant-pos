# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a complete restaurant Point of Sale (POS) system designed for small restaurants. The system supports multi-role access (Admin, Kitchen, Customer) with features including member management, order processing, kitchen operations, and QR code/table-based ordering.

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: Session-based with bcryptjs
- **Frontend**: Static HTML/CSS/JavaScript (no framework)
- **Security**: Helmet.js, rate limiting, input validation
- **Deployment**: Windows service support with one-click installation

## Key Architecture Patterns

### Multi-Role System Architecture
The system serves three distinct user types with separate interfaces:
- **Admin** (`/admin`): Member management, dish management, order tracking, analytics
- **Kitchen** (`/kitchen`): Real-time order queue, status management, large display interface
- **Customer** (`/`): Table selection, menu browsing, cart management, payment processing

### Database Schema Design
Core tables and their relationships:
- `system_users`: Admin/kitchen accounts with role-based access
- `members`: Customer accounts with balance, points, and tier levels
- `categories` + `dishes` + `dish_categories`: Menu management with many-to-many relationships
- `tables`: Restaurant table management
- `orders` + `order_items`: Order processing with itemized details
- `recharge_records`: Member balance transaction history

### Session-Based Authentication
Uses express-session with SQLite session store. Authentication is role-based with middleware protecting routes by user type.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install --production

# Initialize database with sample data
node setup.js

# Start development server
npm run dev

# Start production server
npm start

# Install as Windows service
node install-service.js

# Uninstall Windows service
node uninstall-service.js
```

### Windows Deployment
```bash
# One-click installation (includes dependency install, DB init, service setup)
install.bat

# Service management commands
net start RestaurantPOS
net stop RestaurantPOS
```

## Code Structure

### Route Organization
Routes are organized by functionality in `/routes/`:
- `admin/`: Admin dashboard, member management, dish management
- `api/`: Customer-facing API for ordering, cart, payments
- `kitchen/`: Kitchen order management API
- `auth/`: Authentication endpoints

### Model Architecture
Database models follow Sequelize ORM patterns with:
- Proper associations and relationships
- Validation rules and constraints
- Instance methods for business logic
- Hooks for data integrity

### Frontend Structure
Static files in `/public/` with:
- Modular CSS by component (`css/admin.css`, `css/customer.css`)
- Feature-specific JavaScript files
- Responsive design for mobile/tablet/desktop

## Database Configuration

### Connection Setup
Database configuration in `/config/database.js`:
- Uses SQLite with file-based storage
- Sequelize ORM with proper connection pooling
- Session store configuration

### Migrations and Seeding
- `setup.js`: Complete database initialization with sample data
- Creates default admin/kitchen accounts
- Populates sample menu items, tables, and members
- Sets up categories and dish relationships

## Security Considerations

### Authentication Flow
- Session-based authentication with secure cookies
- Role-based route protection middleware
- Password hashing with bcryptjs
- Input validation and sanitization

### Security Measures
- Helmet.js for security headers
- Rate limiting on authentication endpoints
- File upload restrictions and validation
- SQL injection prevention through Sequelize ORM

## Business Logic Patterns

### Member System
- Tier-based pricing (bronze/silver/gold)
- Balance management with transaction history
- Points accumulation and redemption
- Recharge processing with multiple payment methods

### Order Processing
- Multi-step order workflow: pending → preparing → ready → completed
- Real-time status updates across all interfaces
- Mixed payment support (balance + cash)
- Inventory management integration

### Kitchen Operations
- Real-time order queue with auto-refresh
- Status synchronization across kitchen displays
- Order prioritization and time tracking
- Completion confirmation workflow

## File Upload Management

### Image Handling
- Multer middleware for file uploads
- Size limits and file type validation
- Automatic thumbnail generation
- Organized storage in `/public/uploads/`

### Asset Organization
- Category-based image storage
- Automatic cleanup and maintenance
- Fallback handling for missing images

## Windows Service Integration

### Service Management
- Uses node-windows for service creation
- Automatic service startup configuration
- Error handling and logging integration
- Service status monitoring

### Deployment Considerations
- Path resolution for service execution
- Environment configuration for service mode
- Log file management and rotation
- Backup and maintenance procedures

## Common Development Patterns

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- Database transaction error recovery
- User-friendly error messages

### Validation Patterns
- Input validation at multiple levels
- Database constraint validation
- Business rule validation
- Real-time form validation feedback

### Response Formatting
- Standardized API response structure
- Consistent status codes and messages
- Pagination support for large datasets
- Data transformation for frontend consumption