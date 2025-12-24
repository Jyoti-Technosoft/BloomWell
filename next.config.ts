import type { NextConfig } from "next";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
