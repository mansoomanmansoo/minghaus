import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
