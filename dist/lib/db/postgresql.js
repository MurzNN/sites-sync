import yargsUnparse from "yargs-unparser";
import { execSync } from "child_process";
var commandType;
(function (commandType) {
    commandType["query"] = "psql";
    commandType["dump"] = "pg_dump";
})(commandType || (commandType = {}));
export class dbAdapterClass {
    constructor(connection) {
        this.connection = connection;
    }
    generateCommand(type = "query", options = {}) {
        let pgOptions = {
            d: this.connection.name,
            h: this.connection.host,
            p: this.connection.port,
            U: this.connection.username,
            '_': []
        };
        if (type == 'query' && !options.verbose) {
            pgOptions.quiet = true;
        }
        const pgArguments = Object.assign(Object.assign({}, Object.fromEntries(Object.entries(pgOptions).filter(([_, v]) => v != null))), { _: [] });
        const command = `PGPASSWORD=${this.connection.password} ` +
            commandType[type] +
            " " +
            yargsUnparse(pgArguments).join(" ");
        return command;
    }
    exec(type, input = null, options = {}) {
        if (input) {
            options.input = input;
        }
        else if (!options.stdio) {
            if (type == 'dump') {
                options.stdio = 'inherit';
            }
            else {
                options.stdio = [0, 'inherit', 'inherit'];
            }
        }
        const cmd = this.generateCommand(type);
        const result = execSync(cmd, options);
        if (result) {
            return result.toString();
        }
    }
    dump(execOptions = {}) {
        return this.exec('dump', null, execOptions);
    }
    query(input = null, execOptions = {}) {
        return this.exec('query', input, execOptions);
    }
    clear() {
        const dropAllTablesQuery = `
-- Dropping all tables from database

SET client_min_messages TO ERROR;
DO $$ DECLARE
r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
END LOOP;
END $$;


-- Dropping all sequences from database

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT relname FROM pg_class where relkind = 'S') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.relname) || ' CASCADE';
    END LOOP;
END $$;
`;
        this.query(dropAllTablesQuery);
    }
}
//# sourceMappingURL=postgresql.js.map