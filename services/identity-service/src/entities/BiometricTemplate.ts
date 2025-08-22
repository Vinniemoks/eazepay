import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum BiometricType {
  FINGERPRINT = 'FINGERPRINT',
  FACE = 'FACE',
  VOICE = 'VOICE'
}

@Entity('biometric_templates')
export class BiometricTemplate {
  @PrimaryGeneratedColumn('uuid')
  templateId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.biometricTemplates)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: BiometricType
  })
  templateType: BiometricType;

  @Column('text')
  templateData: string; // Base64 encoded encrypted template

  @Column('decimal', { precision: 3, scale: 2 })
  quality: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
