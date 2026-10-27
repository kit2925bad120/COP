# Backend integration plan

This UI is intentionally dependency-free so it opens immediately. To turn it into the full college project:

## Recommended endpoints

POST /api/auth/login
GET  /api/buses
GET  /api/buses/{id}/location
GET  /api/routes
POST /api/routes
PUT  /api/routes/{id}
DELETE /api/routes/{id}
GET  /api/timings
GET  /api/trips/history
POST /api/boarding/verify
GET  /api/alerts
GET  /api/notifications
GET  /api/fees
POST /api/fees/pay

## JDBC database tables

users(id, username, password_hash, role, full_name, student_id)
buses(id, registration_no, route_id, driver_id, status)
drivers(id, name, phone, license_no, safety_score)
routes(id, route_code, name, start_point, end_point, active)
route_stops(id, route_id, stop_name, stop_order)
timings(id, route_id, departure_time, arrival_time, day_type)
gps_logs(id, bus_id, latitude, longitude, speed, recorded_at)
boarding(id, student_id, bus_id, stop_id, method, verified_at)
trips(id, bus_id, route_id, started_at, ended_at, duration, passengers, status)
alerts(id, bus_id, type, severity, message, created_at, resolved)
fees(id, student_id, amount, due_date, status, paid_at, transaction_ref)
notifications(id, user_id, title, message, created_at, read_status)

For Spring Boot + JDBC, use JdbcTemplate with prepared statements and return JSON DTOs. For true live tracking, use WebSocket/SSE rather than repeatedly refreshing the page.
