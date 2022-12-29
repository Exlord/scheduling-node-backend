import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getIsWorking(): string {
    return 'It Works!';
  }
}
