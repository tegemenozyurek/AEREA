/**
 * Firebase Console → Authentication → Templates → Password reset
 * (Unlike email verification, this template body CAN be edited in Console.)
 */

export const PASSWORD_RESET_SUBJECT = 'Reset your password for %APP_NAME%';

export const PASSWORD_RESET_BODY = `<p>Hello,</p>

<p>Follow <a href="%LINK%" style="color:#0369A1;text-decoration:underline;">this</a> link to reset your %APP_NAME% password for your %EMAIL% account.</p>

<p>If you didn't ask to reset your password, you can ignore this email.</p>

<p>Thanks,</p>

<p>Your %APP_NAME% team</p>`;
