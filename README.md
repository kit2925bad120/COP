# TrackItRide — College Bus Tracking & Management System

A responsive multi-section college transport management website built with vanilla HTML, CSS and JavaScript.

## Included Features

- Role-based login: Admin, Student/Parent, Driver
- Dashboard with fleet KPIs and activity
- Live GPS fleet tracking simulation
- Bus/route cards that can be dragged to reorder
- Route management with search and route creation
- Bus timing and peak-demand view
- Trip history and export-style actions
- Boarding verification / QR scanner demo
- Fee & payment dashboard
- Driver safety alerts and safety scores
- Real-time notifications
- Settings and notification preferences
- Dark mode
- Responsive desktop/tablet/mobile layout
- Toast notifications and simulated live map movement
- No database or external server required for the demo

## Demo Login

Admin: `admin` / `admin123`

Student: `student` / `student123`

Driver: `driver` / `driver123`

## Run

### Easiest
Double-click `index.html`.

### VS Code
Open the folder in VS Code and use Live Server if installed.

## Important

GPS, QR scanning, payments and notifications are simulated in this front-end prototype. For a production project, connect the UI to a Spring Boot/Node/FastAPI backend, MySQL/PostgreSQL, real GPS provider, authentication, payment gateway and WebSocket/MQTT/Kafka event stream.

## Suggested Production Architecture

Frontend → REST/WebSocket API → Backend → MySQL/PostgreSQL
                                  ├→ Redis (live location/cache)
                                  ├→ GPS/telematics provider
                                  ├→ Notification service
                                  └→ Payment gateway
