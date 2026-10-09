import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthSession, SessionUser } from './auth.js';

export const IS_PUBLIC = 'isPublic';

/** Lets signed-out visitors call a route. Every other route needs a session. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export type AuthedRequest = Request & { auth?: AuthSession };

/** The signed-in user, set by SessionGuard. Only use on routes that aren't @Public(). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser => ctx.switchToHttp().getRequest<AuthedRequest>().auth!.user,
);
