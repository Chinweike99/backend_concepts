import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  region: string;

  @Column('bigint')
  population: number;

  @Column({ name: 'currency_code', nullable: true })
  currency_code: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 10, scale: 4, nullable: true })
  exchange_rate: number;

  @Column({ name: 'estimated_gdp', type: 'decimal', precision: 20, scale: 2, nullable: true })
  estimated_gdp: number;

  @Column({ name: 'flag_url', nullable: true })
  flag_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'last_refreshed_at', type: 'timestamp' })
  last_refreshed_at: Date;
}