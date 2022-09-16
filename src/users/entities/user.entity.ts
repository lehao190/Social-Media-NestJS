import { Post } from 'src/posts/entities/post.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  
  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: ["insert", "update"]
  })
  posts: Post[];
}