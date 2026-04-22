import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Rotas explicitamente públicas — o middleware não força login aqui.
 * Tudo o mais exige sessão válida.
 */
const PUBLIC_PATHS = new Set<string>(["/login"]);

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Revalida a sessão. Obrigatório logo após createServerClient em middleware
  // para rotacionar o cookie de forma segura.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Casa tudo EXCETO:
     * - _next/static, _next/image (assets)
     * - favicon, imagens estáticas
     * - rota pública /api/health (se houver)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
