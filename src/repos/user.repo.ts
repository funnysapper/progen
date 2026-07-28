import prisma from "../config/prisma";

export class UserRepo{
   createLocalUser(name: string,email: string, hashedPassword: string){
      return prisma.user.create({data: {name, email, password: hashedPassword}});
   }

   createGoogleUser(name: string, email:string, googleId:string){
      return prisma.user.create({data: {name, email, googleId, provider: 'GOOGLE'}});
   }

   findByEmail(email:string){
      return prisma.user.findUnique({where: {email}});
   }

   linkByGoogleId(id:string, googleId:string){
      return prisma.user.update({where:{id}, data:{googleId}})
   }

   findById(id:string){
      return prisma.user.findUnique({where: {id}});
   }

   storeRefreshToken(token:string, userId:string, expiresAt: Date){
      return prisma.refreshToken.create({data: {token, userId, expiresAt}});
   }   

   findRefreshToken(token: string) {
      return prisma.refreshToken.findUnique({ where: { token } });
   }

   revokeRefreshToken(token: string) {
      return prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
  }

   findByGoogleId(googleId: string) {
      return prisma.user.findUnique({ where: { googleId } });
  }
}
