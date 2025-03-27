interface ResetPasswordEmailTemplateProps {
    email: string;
    resetPasswordToken: string;
}

export const ResetPasswordEmailTemplate: React.FC<Readonly<ResetPasswordEmailTemplateProps>> = ({ email, resetPasswordToken }) => (
    <div>
        <h1>Reset password for <b>{email}</b></h1>
        <p>
            To reset your password, click the link and follow the instructions:
        </p>
        <a href={`https://tradeez.ie/changePassword?token=${resetPasswordToken}`}>Reset password
            Click here to reset password
        </a>
    </div>
)
