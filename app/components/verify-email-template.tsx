import { Stringifiable } from "query-string";

interface VerfiyEmailTemplateProps {
    email: string;
    verifyEmailToken: string;
}

export const VerifyEmailTemplate: React.FC<Readonly<VerfiyEmailTemplateProps>> = ({ email, verifyEmailToken }) => (
    <div>
        <h1>Verify email for <b>{email}</b></h1>
        <p>
            To verify your email, click on this link:
        </p>
        <a href={`https://tradeez.ie/verify-email?token=${verifyEmailToken}`}>
            Click here to verify your email
        </a>
    </div>
)
