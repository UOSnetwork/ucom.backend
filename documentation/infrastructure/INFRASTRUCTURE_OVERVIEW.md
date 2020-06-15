# Infrastructure

## Schema

![Current infrastructure](https://raw.githubusercontent.com/UOSnetwork/ucom.backend/master/documentation/jpg/production-infrastructure.jpg)


[Desired infrastructure](../jpg/web-application-desired-infrastructure.jpg)

Notes:
* Cloudflare filters all incoming requests to the backend application, except manager's access to PostgreSQL replication servers
* Frontend application can work in two states - server-side-rendering and single-page-application.
* An access to the blockchain nodes is provided through HAProxy balancer.

## Steps to create a new node for web application
* Create a node itself
* Create a domain name, follow the name convention 
* Provide access to an API through NGINX (SSL)
* Increase a default NGINX post limit up to 200M
* Disable CORS policy (for beta implementations)
* Implement monitoring. See above.

### Blockchain nodes monitoring:
* Server itself. Basic Zabbix metrics - CPU, RAM, Disk, etc.
* Node itself. A get_info HTTP response status must be 200. 
Example request: https://mini-mongo.ucommunity.io:7889/v1/chain/get_info
* Last block delay. `head_block_time` delay should be no more than 10 minutes.
* A load balancer (NGINX) monitoring.

