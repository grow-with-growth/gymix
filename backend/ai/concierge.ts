import { StudentAI } from './roles/student';
import { TeacherAI } from './roles/teacher';

export class ConciergeAI {
  private studentAI = new StudentAI();
  private teacherAI = new TeacherAI();

  async getResponse(prompt: string, role: string): Promise<string> {
    switch (role) {
      case 'student':
        return this.studentAI.getResponse(prompt);
      case 'teacher':
        return this.teacherAI.getResponse(prompt);
      default:
        return 'Invalid role specified.';
    }
  }
}

