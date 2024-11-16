import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StarknetVerifyHistoryCreateVo } from './vo/starknet-verify-history-create.vo';

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

  static create(vo: StarknetVerifyHistoryCreateVo) {
    const starknetVerifyHistory = new StarknetVerifyHistory();
    starknetVerifyHistory.chainId = vo.chainId;
    starknetVerifyHistory.contractAddress = vo.contractAddress;
    starknetVerifyHistory.classHash = vo.classHash;
    starknetVerifyHistory.compiledClassHash = vo.compiledClassHash;
    starknetVerifyHistory.declareTxHash = vo.declareTxHash;
    starknetVerifyHistory.compileTimestamp = vo.compileTimestamp;
    starknetVerifyHistory.verifiedTimestamp = vo.verifiedTimestamp;
    starknetVerifyHistory.scarbVersion = vo.scarbVersion;
    starknetVerifyHistory.verifyRequestAddress = vo.verifyRequestAddress;
    starknetVerifyHistory.createdAt = new Date();
    starknetVerifyHistory.updatedAt = new Date();
    return starknetVerifyHistory;
  }
}
