# Copilot Instructions - Sistem Kasir CV Sari Bumi Sakti

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a comprehensive Point of Sale (POS) web application for CV Sari Bumi Sakti, a company specializing in traditional herbal oil production and sales.

## Technology Stack

- **Frontend**: Vue.js 3 with Composition API
- **UI Framework**: Vuetify 3 for responsive design
- **Backend & Database**: Firebase (Firestore NoSQL, Firebase Authentication)
- **State Management**: Pinia for global state management
- **Routing**: Vue Router for SPA navigation
- **Charts**: Recharts for data visualization
- **Export**: jsPDF and SheetJS (xlsx) for report exports

## Database Schema (Firestore Collections)

- `users`: User management with roles (admin, kasir)
- `customers`: Customer information
- `categories`: Product categories
- `products`: Product catalog with inventory
- `transactions`: Sales transactions
- `transaction_details`: Transaction line items
- `payments`: Payment records

## Role-Based Access Control

- **Admin**: Full CRUD access, complete reports, notifications
- **Kasir**: Transaction focus, limited data access, own transaction history

## Key Features

- User authentication and authorization
- Real-time inventory management
- Interactive POS system with shopping cart
- Comprehensive reporting and analytics
- Receipt printing and WhatsApp integration
- Responsive design for desktop, tablet, and mobile

## Development Guidelines

- Use Vue 3 Composition API consistently
- Implement reusable Vuetify components
- Follow Firebase best practices for security
- Ensure real-time data synchronization
- Optimize for performance with lazy loading
- Maintain responsive design principles
