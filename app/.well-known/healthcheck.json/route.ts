import { NextResponse } from 'next/server';

/**
 * GET /.well-known/healthcheck.json
 *
 * Liveness probe consumed by the openresty sidecar (and through it the ELB
 * health check) on the EB Docker deployment. Legacy condenser serves this
 * exact path; any 200 response marks the instance healthy.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
