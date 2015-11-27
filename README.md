
[![travis status](https://travis-ci.org/scrollback/scrollback.svg?branch=master)](https://travis-ci.org/scrollback/scrollback)

## Scrollback, where communities hang out

Scrollback provides a free-to-use service at [scrollback.io](http://scrollback.io). If you’re planning to run a community chat room, you should [try it](https://scrollback.io/me) out now!

You can even [embed Scrollback room](https://github.com/scrollback/scrollback/wiki/Basic-Usage#embed-scrollback-room) on your webpage/blog.

## Install

### 1. Install dependencies
- Node.js (0.12 or higher)
- Postgres (9.4 or higher)
- Redis
- Gulp (globally)

### 2. Create Postgres db and user for scrollback (recommended)

If you skip this step, configure Scrollback to use an existing user and database using the Configure step below.

Sign into `psql` as the administrator account (`postgres` in Linux, the user who installed PostgreSQL in OSX)

```sql
CREATE USER scrollback PASSWORD scrollback;
CREATE DATABASE scrollback;
\c scrollback
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scrollback;
```

### 3. Create scrollback tables
```sh
psql -U scrollback < tools/pg/sbentity.sql
psql -U scrollback < tools/pg/sbcontent.sql
psql -U scrollback < tools/pg/sbnotes.sql
```

### 4. Install npm dependencies
```sh
npm install
```

### 5. Build the client
```sh
gulp
```
You must rebuild the client every time you change client configuration or modify any of the client code.

### 6. Run Scrollback
```sh
node index.js
```
Scrollback will print warnings about newrelic (a performance monitoring service) not being configured and about not being able to connect to the IRC and Threader processes. You can ignore them.

If you wish to connect to IRC, run the Scrollback IRC bouncer as root:
```sh
node ircClient/server.js
```
Running as root is necessary because it needs to listen on port 113 (identd) which is required by some IRC networks.

### Configure (optional)

Creating `server-config.js` and `client-config.js` files where you can override values from [`server-config-defaults.js`](https://github.com/scrollback/scrollback/blob/master/server-config-defaults.js) and [`client-config-defaults.js`](https://github.com/scrollback/scrollback/blob/master/client-config-defaults.js). Example:

```
module.exports = {
	core: {
		name: "scrollback"
	}
}
```

## Contribute to Scrollback

We maintain a [wiki](https://github.com/scrollback/scrollback/wiki) that explains Scrollback architecture. It's a work-in-progress so please let us know if there are gaps in the content. Better yet, feel free to send us a Pull Request to make it better.

## License

Scrollback is licensed under GNU Affero General Public License. For more information see [http://www.gnu.org/licenses/agpl-3.0.html](http://www.gnu.org/licenses/agpl-3.0.html)
