import Modules from '@/ui/modules';
import TabbedContent from './TabbedContent';

interface TabbedContentModuleProps {
  data: {
    content?: any;
    pretitle?: string;
    tabs?: {
      title: string;
      icon: Sanity.Icon;
      content: any[];
    }[];
  };
  isTabbedModule?: boolean;
}

export default function TabbedContentModule({ data }: TabbedContentModuleProps) {
  if (!data?.tabs || data.tabs.length === 0) return null;

  const { content, pretitle, tabs = [] } = data;

  // Map tabs to the format expected by the TabbedContent component
  const mappedTabs = tabs.map((tab) => ({
    title: tab.title,
    icon: tab.icon,
    content: <Modules modules={tab.content} isTabbedModule />,
  }));

  return <TabbedContent content={content} pretitle={pretitle} tabs={mappedTabs} />;
}
