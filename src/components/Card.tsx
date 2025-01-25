import clsx from 'clsx';

export const Card = ({children, className}: any) => {
  return (
    <div
      className={clsx('rounded-lg border bg-white text-[#09090b] shadow-sm', className)}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({children, className}: any) => {
  return (
    <div
      className={clsx('flex flex-col space-y-1.5 p-6', className)}
    >
      {children}
    </div>
  );
}

export const CardTitle = ({children, className}: any) => {
  return (
    <div
      className={clsx('text-2xl font-semibold leading-none tracking-tight', className)}
    >
      {children}
    </div>
  );
}

export const CardDescription = ({children, className}: any) => {
  return (
    <div
      className={clsx('text-sm text-[#09090b]', className)}
    >
      {children}
    </div>
  );
}

export const CardContent = ({children, className}: any) => {
  return (
    <div
      className={clsx('p-6 pt-0', className)}
    >
      {children}
    </div>
  );
}

export const CardFooter = ({children, className}: any) => {
  return (
    <div
      className={clsx('flex items-center p-6 pt-0', className)}
    >
      {children}
    </div>
  );
}