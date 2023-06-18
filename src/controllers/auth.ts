import { Request, Response } from 'express'
import User from '../models/User'
import cloudinary from 'cloudinary'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export const signup = async (req: Request & { files?: any }, res: Response) => {
    try {
        const { fullname, username, emailAddress, password, accountBalance = 0 } = req.body
        if (!fullname) {
            return res.status(400).json({ message: 'Fullname is required' })
        }
        if (!username) {
            return res.status(400).json({ message: 'Username is required' })
        }
        if (!emailAddress) {
            return res.status(400).json({ message: 'Email address is required' })
        }
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))) {
            return res.status(400).json({ message: 'Invalid email address' })
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password should be atleast 6 characters long' })
        }

        const usernameExists = await User.findOne({ username })
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is taken' })
        }

        const userExists = await User.findOne({ emailAddress })
        if (userExists) {
            return res.status(400).json({ message: 'User exists' })
        }

        let avatar = ''

        if (req?.files) {
            const result = await cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, { folder: 'trakka--user-avatars' })
            avatar = result.secure_url
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            fullname, username, emailAddress, password: hashedPassword, avatar, accountBalance
        })

        const token = jwt.sign({ _id: user._id, fullname, username, emailAddress, avatar, accountBalance }, process.env.JWT_SECRET as string)

        res.status(201).json({ message: 'Account created successfully', token })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { username, emailAddress, password } = req.body
        if (!username && !emailAddress) {
            return res.status(400).json({ message: 'Username or email address is required' })
        }

        if (emailAddress) {
            if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))) {
                return res.status(400).json({ message: 'Invalid email address' })
            }
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' })
        }

        let user: any = null

        if (username) {
            user = await User.findOne({ username }).select('+password')
        } else {
            user = await User.findOne({ emailAddress }).select('+password')
        }

        const passwordMatched = await bcrypt.compare(password, user?.password)

        if (!passwordMatched) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ _id: user._id, fullname: user.fullname, username: user.username, emailAddress: user.emailAddress, avatar: user.avatar, accountBalance: user.accountBalance }, process.env.JWT_SECRET as string)

        res.status(200).json({ token })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { emailAddress } = req.body
        if(!(emailAddress?.trim())){
          res.status(400).json({message: 'Email address is required'})
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(emailAddress)) {
            return res.status(400).json({ message: 'Invalid email address' })
        }

        const user : any = await User.findOne({ emailAddress })

        if (!user) {
            return res.status(400).json({ message: 'Account does not exist' })
        }

        const passwordResetToken = Math.floor(Math.random() * 1000000)


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            secureConnection: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL as string,
                pass: process.env.NODEMAILER_PASS as string
            }
        } as nodemailer.TransportOptions);

        const mailOptions = {
            from: 'sakawahab03@gmail.com',
            to: user.emailAddress,
            subject: 'trakka password reset token',
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    a {
      color: #3869D4;
    }
    a img {
      border: none;
    }
    td {
      word-break: break-word;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    body,
    td,
    th {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 22px;
      font-weight: bold;
      text-align: left;
    }
    
    td,
    th {
      font-size: 16px;
    }
    
    p,
    ul,
    ol,
    blockquote {
      margin: .4em 0 1.1875em;
      font-size: 16px;
      line-height: 1.625;
    }
    
    p.sub {
      font-size: 13px;
    }
    /* Utilities ------------------------------ */
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .align-center {
      text-align: center;
    }
    
    .u-margin-bottom-none {
      margin-bottom: 0;
    }
    /* Buttons ------------------------------ */
    .button {
      display: inline-block;
      color: #FFF;
      text-decoration: none;
      border-radius: 3px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
      font-size: 24px;
      font-weight: bold
    }
    .button--green {
      background-color: #071f3b;
      padding: 10px 20px;
    }
    
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
        text-align: center !important;
      }
    }

    /* Social Icons ------------------------------ */
    
    .social {
      width: auto;
    }
    
    .social td {
      padding: 0;
      width: auto;
    }
    
    .social_icon {
      height: 20px;
      margin: 0 8px 10px 8px;
      padding: 0;
    }
    /* Data table ------------------------------ */
    
    
    body {
      background-color: #F2F4F6;
      color: #51545E;
    }
    
    p {
      color: #51545E;
    }
    
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F2F4F6;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    /* Masthead ----------------------- */
    
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      width: 94px;
    }
    
    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    /* Body ------------------------------ */
    
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #A8AAAF;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }
    
    .content-cell {
      padding: 45px;
    }
    /*Media Queries ------------------------------ */
    
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body,
      .email-body,
      .email-body_inner,
      .email-content,
      .email-wrapper,
      .email-masthead,
      .email-footer {
        background-color: #333333 !important;
        color: #FFF !important;
      }
      p,
      ul,
      ol,
      blockquote,
      h1,
      h2,
      h3,
      span,
      .purchase_item {
        color: #FFF !important;
      }
      .attributes_content,
      .discount {
        background-color: #222 !important;
      }
      .email-masthead_name {
        text-shadow: none !important;
      }
    }
    
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
  </head>
  <body>
    <span class="preheader">Use this token to reset your password. The link is only valid for 1hr.</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell">
                      <div class="f-fallback">
                        <h1>Hi ${user.username},</h1>
                        <p>You recently requested to reset your password for your trakka account. Use the button below to reset it. <strong>This password reset token is only valid for the next 1hour.</strong></p>
                        <!-- Action -->
                        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td align="center">
                              <!-- Border based button
           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                <tr>
                                  <td align="center">
                                    <p class="f-fallback button button--green">${passwordResetToken}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p>Thanks,
                          <br>The trakka team</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell" align="center">
                      <p class="f-fallback sub align-center">
                        trakka
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
        };

        await transporter.sendMail(mailOptions);

        user.passwordResetToken = passwordResetToken
        user.passwordResetTokenUsed = false
        user.passwordResetTokenExpiry = new Date(Date.now() + 3600000)
        await user.save()


        res.status(200).json({ message: 'Password reset token sent to your email' })


    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const resetPassword = async (req: Request, res : Response) => {
  try {
    const { newPassword, passwordResetToken, emailAddress } = req.body
    if (!passwordResetToken) {
      return res.status(400).json({ message: 'Password reset token is required' })
    }
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password should be atleast 6 characters long' })
    }
    if(!(emailAddress?.trim())){
      return res.status(400).json({message: 'Email address is required'})
    }

    const user: any = await User.findOne({ emailAddress }).select('+passwordResetToken').select('+passwordResetTokenExpiry').select('+passwordResetTokenUsed')

    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    if (user.passwordResetToken != passwordResetToken) {
      return res.status(400).json({ message: 'Invalid password reset token' })
    }

    if (user.passwordResetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Expired token' })
    }

    if (user.passwordResetTokenUsed) {
      return res.status(400).json({ message: 'Used token' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.passwordResetTokenUsed = true
    await user.save()

    res.status(200).json({ message: 'Password reset successful' })

  } catch (error: any) {
    console.log(error.message)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

