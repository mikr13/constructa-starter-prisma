import { AuthCard, type AuthCardProps } from '@daveyplate/better-auth-ui';
import { authCardClassNames, authCardLocalization } from './auth-styles';

export function CustomAuthCard(props: AuthCardProps) {
  return (
    <AuthCard
      {...props}
      classNames={{
        ...authCardClassNames,
        ...props.classNames,
      }}
      localization={{
        ...authCardLocalization,
        ...props.localization,
      }}
    />
  );
}
