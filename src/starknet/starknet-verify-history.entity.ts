import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('starknet_verify_history')
export class StarknetVerifyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  chainId: string;

  @Column({ type: 'varchar', nullable: false })
  contractAddress: string;

  @Column({ type: 'varchar', nullable: false })
  classHash: string;

  @Column({ type: 'varchar', nullable: false })
  compiledClassHash: string;

  @Column({ type: 'varchar', nullable: false })
  declareTxHash: string;

  @Column({ type: 'varchar', nullable: false })
  scarbVersion: string;

  @Column({ type: 'bigint', nullable: false })
  compileTimestamp: number | null;

  @Column({ type: 'bigint', nullable: false })
  verifiedTimestamp: number | null;

  @Column({ type: 'varchar', nullable: true })
  verifyRequestAddress: string | undefined;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  createdAt: Date | null;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date | null;
}
