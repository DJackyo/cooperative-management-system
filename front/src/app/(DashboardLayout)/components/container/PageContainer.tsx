import { JSX } from 'react';
import Head from 'next/head';


type Props = {
  description?: string;
  children: React.ReactNode | React.ReactNode[];
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
    {children}
  </div>
);

export default PageContainer;
