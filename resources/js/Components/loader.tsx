export const Loader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6';

    return (
        <div className={`animate-spin rounded-full border-t-4 border-blue-500 border-solid ${sizeClasses}`} />
    );
};
