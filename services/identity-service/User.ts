import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterLoad } from 'typeorm';
import { HybridEncryptor } from '@eazepay/crypto-utils';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  encryptedEmail: string;

  // Non-persisted property to hold the decrypted email value
  email: string;

  private static hybridEncryptor = new HybridEncryptor();
  private static publicKeys = User.hybridEncryptor.getPublicKeys();

  @BeforeInsert()
  async encryptEmail() {
    if (this.email) {
      const encrypted = await User.hybridEncryptor.encrypt(this.email, User.publicKeys);
      this.encryptedEmail = JSON.stringify(encrypted);
      this.email = undefined; // Clear the original email after encryption
    }
  }

  @AfterLoad()
  async decryptEmail() {
    if (this.encryptedEmail) {
      try {
        const encrypted = JSON.parse(this.encryptedEmail);
        this.email = await User.hybridEncryptor.decrypt(encrypted);
      } catch (error) {
        console.error('Failed to decrypt email', error);
        this.email = '[Decryption Failed]'; // Handle decryption errors gracefully
      }
    }
  }
}