import { Pool, PoolConfig } from 'pg';

function parseConnectionString(connStr: string | undefined): PoolConfig {
  if (!connStr) return {};

  try {
    const withoutProtocol = connStr.replace(/^postgres(?:ql)?:\/\//, '');
    const lastAtIdx = withoutProtocol.lastIndexOf('@');
    
    if (lastAtIdx === -1) {
      return { connectionString: connStr };
    }

    const authPart = withoutProtocol.substring(0, lastAtIdx);
    const hostDbPart = withoutProtocol.substring(lastAtIdx + 1);
    
    const firstColonIdx = authPart.indexOf(':');
    const user = authPart.substring(0, firstColonIdx);
    // Un-encode if someone provided an encoded string, otherwise use raw
    const rawPassword = authPart.substring(firstColonIdx + 1);
    const password = rawPassword.includes('%') ? decodeURIComponent(rawPassword) : rawPassword;
    
    const slashIdx = hostDbPart.indexOf('/');
    const hostPortPart = hostDbPart.substring(0, slashIdx);
    const database = hostDbPart.substring(slashIdx + 1);
    
    const [host, portStr] = hostPortPart.split(':');
    const port = portStr ? parseInt(portStr, 10) : 5432;

    return {
      user,
      password,
      host,
      port,
      database
    };
  } catch (error) {
    console.warn('Failed to manually parse connection string, falling back to pg defaults', error);
    return { connectionString: connStr };
  }
}

// Create a connection pool using the manually parsed config
const poolConfig = parseConnectionString(process.env.DATABASE_URL);
const pool = new Pool(poolConfig);

export const db = {
  // Expose a query function to run raw SQL
  query: (text: string, params?: any[]) => pool.query(text, params),
  // Expose connect to allow transactions
  getClient: () => pool.connect(),
};
