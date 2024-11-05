import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service'; // Asegúrate de tener un servicio Auth
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
