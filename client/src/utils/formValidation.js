import * as Yup from 'yup';

export const contactValidationSchema  = Yup.object().shape({
    name: Yup.string()
        .required('Full Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email address')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
    subject: Yup.string()
        .required('Subject is required')
        .oneOf(['support', 'feedback', 'partnership', 'other'], 'Invalid subject selection'),
    message: Yup.string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(500, 'Message must be at most 500 characters')
});

export const loginValidationSchema = Yup.object().shape({
    loginField: Yup.string()
        .required('Username or Email is required')
        .min(3, 'Username must be at least 3 characters'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
});

export const registrationValidationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be at most 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscore'),
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email address')
        .max(100, 'Email cannot exceed 100 characters')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must include uppercase, lowercase, number, and special character'
        ),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required')
});

export const changePasswordValidationSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .required('Old password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'New password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must include uppercase, lowercase, number, and special character'
        ),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm new password is required'),
});

export const titleValidationSchema = (type) => {
    return Yup.object().shape({
        titleName: Yup.string()
            .required('Title name is required')
            .max(255, 'Title cannot exceed 255 characters'),

        description: Yup.string()
            .max(2000, 'Description cannot exceed 2000 characters'),
    });
};
