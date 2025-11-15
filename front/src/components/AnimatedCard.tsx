import React from 'react';
import { Card, CardProps, Fade, Grow } from '@mui/material';
import { useInView } from 'react-intersection-observer';

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'grow' | 'slide';
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animationType = 'fade',
  delay = 0,
  sx,
  ...props
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getAnimation = () => {
    switch (animationType) {
      case 'fade':
        return (
          <Fade in={inView} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
            <Card
              ref={ref}
              sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
                ...sx,
              }}
              {...props}
            >
              {children}
            </Card>
          </Fade>
        );
      case 'grow':
        return (
          <Grow in={inView} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
            <Card
              ref={ref}
              sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: (theme) => theme.shadows[8],
                },
                ...sx,
              }}
              {...props}
            >
              {children}
            </Card>
          </Grow>
        );
      case 'slide':
        return (
          <Card
            ref={ref}
            sx={{
              transform: inView ? 'translateX(0)' : 'translateX(-50px)',
              opacity: inView ? 1 : 0,
              transition: `all 0.6s ease-in-out ${delay}ms`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.shadows[6],
              },
              ...sx,
            }}
            {...props}
          >
            {children}
          </Card>
        );
      default:
        return (
          <Card ref={ref} sx={sx} {...props}>
            {children}
          </Card>
        );
    }
  };

  return getAnimation();
};

export default AnimatedCard;