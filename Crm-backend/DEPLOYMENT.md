# Docker Deployment Guide

This guide will help you deploy your CRM backend using Docker with MySQL.

## Prerequisites

- Docker Desktop installed on your system
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone and navigate to the project directory:**
   ```bash
   cd Crm-backend
   ```

2. **Update environment variables:**
   Edit the `docker-compose.yml` file and update the following variables:
   - `JWT_SECRET`: Replace with a strong, unique secret key
   - `OAUTH2_CLIENT_ID` and `OAUTH2_CLIENT_SECRET`: Replace with your OAuth credentials
   - Database passwords (recommended for production)

3. **Build and start the services:**
   ```bash
   docker-compose up --build -d
   ```

4. **Check the status:**
   ```bash
   docker-compose ps
   ```

5. **View logs:**
   ```bash
   # View all logs
   docker-compose logs

   # View specific service logs
   docker-compose logs backend
   docker-compose logs mysql
   ```

## Services

### MySQL Database
- **Container name:** `crm-mysql`
- **Port:** `3306`
- **Database:** `crm_db`
- **Username:** `crm_user`
- **Password:** `crm_password`

### Backend API
- **Container name:** `crm-backend`
- **Port:** `3000`
- **Health check:** `http://localhost:3000/api/health`

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | Database host | `mysql` |
| `DB_USERNAME` | Database username | `crm_user` |
| `DB_PASSWORD` | Database password | `crm_password` |
| `DB_NAME` | Database name | `crm_db` |
| `JWT_SECRET` | JWT signing secret | **Change this!** |

## Management Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Rebuild and restart
```bash
docker-compose down
docker-compose up --build -d
```

### View logs
```bash
docker-compose logs -f backend
```

### Access MySQL
```bash
docker-compose exec mysql mysql -u crm_user -p crm_db
```

### Run migrations manually
```bash
docker-compose exec backend npm run migrate:ts
```

### Backup database
```bash
docker-compose exec mysql mysqldump -u crm_user -p crm_db > backup.sql
```

## Production Deployment

For production deployment, consider the following:

1. **Security:**
   - Change all default passwords
   - Use Docker secrets for sensitive data
   - Enable SSL/TLS
   - Set up proper firewall rules

2. **Performance:**
   - Use production-grade MySQL configuration
   - Set up proper logging
   - Configure resource limits

3. **Monitoring:**
   - Add health checks
   - Set up log aggregation
   - Monitor resource usage

4. **Backup:**
   - Set up automated database backups
   - Store backups in secure location
   - Test restore procedures

## Troubleshooting

### Backend won't start
1. Check if MySQL is ready:
   ```bash
   docker-compose logs mysql
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

### Database connection issues
1. Verify environment variables in `docker-compose.yml`
2. Check if MySQL container is healthy:
   ```bash
   docker-compose ps
   ```

### Permission issues
1. Check file ownership in uploads directory
2. Verify Docker user permissions

### Reset everything
```bash
docker-compose down -v
docker-compose up --build -d
```

## API Endpoints

Once deployed, your API will be available at:
- Base URL: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`
- Authentication: `http://localhost:3000/api/auth`

## Data Persistence

- MySQL data is persisted in the `mysql_data` Docker volume
- Uploaded files are persisted in the `./uploads` directory

## Scaling

To scale the backend service:
```bash
docker-compose up --scale backend=3 -d
```

Note: You'll need to set up a load balancer for multiple backend instances.
