import nodemailer from 'nodemailer';

interface MailInterface {
    from: string,
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    text: string,
    html: string,
}

export default class MailService {
    private static instance: MailService;
    private transporter: nodemailer.Transporter;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor() {
        this.transporter = nodemailer.createTransport({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_TLS === 'yes',
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    //INSTANCE CREATE FOR MAIL
    static getInstance() {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }
    //SEND MAIL
    async sendMail(
        options: MailInterface
    ) {
        return this.transporter
            .sendMail({
                from: process.env.SMTP_SENDER,
                to: process.env.EMAIL_RECEIVER,
                cc: options.cc ?? "",
                bcc: options.bcc ?? "",
                subject: options.subject,
                text: options.text ?? "",
                html: options.html
            })
            .then();
    }
}