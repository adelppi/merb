import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AGENTS.md にはこのリポジトリの決まりを書くので、next dev に書き足させない。
  agentRules: false,
};

export default nextConfig;
