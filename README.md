# sites-sync
Tools for automate sync of dynamic data (content like database and files) between sites as npm js package.

To configure list of sites you must copy `node_modules/sites-sync/sites-sync.example.yml`
to `sites-sync.yml` in root of your project, and describe all sites.

## Usage
- `yarn sites-list` - list of configured sites.
- `yarn site-import [site-id]` - import data (db and files) from remote site.
- `yarn site-ssh [site-id]` - make ssh connection to remote site.
- `yarn db-backup` - make a dump of current site database to file.
- `yarn db-restore` - restore database from dump file to current site.
- `yarn db-dump` - output gzipped dump of database to console.

