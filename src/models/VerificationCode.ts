import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 11 })
  @Index('idx_phone')
  phone!: string;

  @Column({ length: 6 })
  code!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // 验证码过期时间
  @Column({ name: 'expires_at' })
  expiresAt!: Date;
}
