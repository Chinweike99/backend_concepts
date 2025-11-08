/**
 * This tells Nest to use the 'jwt' strategy from JwtStrategy.
 */

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){}