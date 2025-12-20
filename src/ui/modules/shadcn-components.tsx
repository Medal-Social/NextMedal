import {
  AlertCircle,
  Bell,
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Terminal,
  User,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GalleryComponent } from './ComponentGallery.client';

export const shadcnComponents: GalleryComponent[] = [
  {
    id: 'shadcn-accordion',
    name: 'Accordion',
    category: 'UI Components',
    moduleType: 'ui-accordion',
    description:
      'A vertically stacked set of interactive headings that each reveal a section of content.',
    children: (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components&apos; aesthetic.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    id: 'shadcn-alert',
    name: 'Alert',
    category: 'UI Components',
    moduleType: 'ui-alert',
    description: 'Displays a callout for user attention.',
    children: (
      <div className="flex flex-col gap-4 w-full">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components to your app using the cli.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    id: 'shadcn-avatar',
    name: 'Avatar',
    category: 'UI Components',
    moduleType: 'ui-avatar',
    description: 'An image element with a fallback for representing the user.',
    children: (
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    id: 'shadcn-badge',
    name: 'Badge',
    category: 'UI Components',
    moduleType: 'ui-badge',
    description: 'Displays a badge or a component that looks like a badge.',
    children: (
      <div className="flex gap-2 flex-wrap">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    ),
  },
  {
    id: 'shadcn-button',
    name: 'Button',
    category: 'UI Components',
    moduleType: 'ui-button',
    description: 'Displays a button or a component that looks like a button.',
    children: (
      <div className="flex gap-2 flex-wrap">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    ),
  },
  {
    id: 'shadcn-card',
    name: 'Card',
    category: 'UI Components',
    moduleType: 'ui-card',
    description: 'Displays a card with header, content, and footer.',
    children: (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    id: 'shadcn-checkbox',
    name: 'Checkbox',
    category: 'UI Components',
    moduleType: 'ui-checkbox',
    description: 'A control that allows the user to toggle between checked and not checked.',
    children: (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    ),
  },
  {
    id: 'shadcn-dialog',
    name: 'Dialog',
    category: 'UI Components',
    moduleType: 'ui-dialog',
    description: 'A window overlaid on either the primary window or another dialog window.',
    children: (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
          </div>
          <Button type="submit">Save changes</Button>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    id: 'shadcn-dropdown-menu',
    name: 'Dropdown Menu',
    category: 'UI Components',
    moduleType: 'ui-dropdown-menu',
    description:
      'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
    children: (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: 'shadcn-hover-card',
    name: 'Hover Card',
    category: 'UI Components',
    moduleType: 'ui-hover-card',
    description: 'For sighted users to preview content available behind a link.',
    children: (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@nextjs</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
              <div className="flex items-center pt-2">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />{' '}
                <span className="text-xs text-muted-foreground">Joined December 2021</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    id: 'shadcn-input',
    name: 'Input',
    category: 'UI Components',
    moduleType: 'ui-input',
    description: 'Displays a form input field or a component that looks like an input field.',
    children: (
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Input type="email" placeholder="Email" />
        <Input type="text" placeholder="Disabled" disabled />
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="email" placeholder="Email" />
          <Button type="submit">Subscribe</Button>
        </div>
      </div>
    ),
  },
  {
    id: 'shadcn-progress',
    name: 'Progress',
    category: 'UI Components',
    moduleType: 'ui-progress',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    children: <Progress value={33} className="w-[60%]" />,
  },
  {
    id: 'shadcn-radio-group',
    name: 'Radio Group',
    category: 'UI Components',
    moduleType: 'ui-radio-group',
    description:
      'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.',
    children: (
      <RadioGroup defaultValue="option-one">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-one" id="option-one" />
          <Label htmlFor="option-one">Option One</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-two" id="option-two" />
          <Label htmlFor="option-two">Option Two</Label>
        </div>
      </RadioGroup>
    ),
  },
  {
    id: 'shadcn-scroll-area',
    name: 'Scroll Area',
    category: 'UI Components',
    moduleType: 'ui-scroll-area',
    description: 'Augments native scroll functionality for custom, cross-browser styling.',
    children: (
      <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
        Jokester began sneaking into the castle in the middle of the night and leaving jokes all
        over the place: under the king&apos;s pillow, in his soup, even in the royal toilet. The
        king was furious, but he couldn&apos;t seem to stop Jokester. And then, one day, the people
        of the kingdom discovered that the jokes were actually funny, and they started laughing. And
        then they started dancing. And then they started singing. And then they started hugging.
      </ScrollArea>
    ),
  },
  {
    id: 'shadcn-select',
    name: 'Select',
    category: 'UI Components',
    moduleType: 'ui-select',
    description: 'Displays a list of options for the user to pick from—triggered by a button.',
    children: (
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    id: 'shadcn-separator',
    name: 'Separator',
    category: 'UI Components',
    moduleType: 'ui-separator',
    description: 'Visually or semantically separates content.',
    children: (
      <div className="w-full max-w-sm">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
          <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Blog</div>
          <Separator orientation="vertical" />
          <div>Docs</div>
          <Separator orientation="vertical" />
          <div>Source</div>
        </div>
      </div>
    ),
  },
  {
    id: 'shadcn-sheet',
    name: 'Sheet',
    category: 'UI Components',
    moduleType: 'ui-sheet',
    description:
      'Extends the Dialog component to display content that complements the main screen.',
    children: (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </SheetContent>
      </Sheet>
    ),
  },
  {
    id: 'shadcn-skeleton',
    name: 'Skeleton',
    category: 'UI Components',
    moduleType: 'ui-skeleton',
    description: 'Use to show a placeholder while content is loading.',
    children: (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ),
  },
  {
    id: 'shadcn-slider',
    name: 'Slider',
    category: 'UI Components',
    moduleType: 'ui-slider',
    description: 'An input where the user selects a value from within a given range.',
    children: <Slider defaultValue={[50]} max={100} step={1} className="w-[60%]" />,
  },
  {
    id: 'shadcn-spinner',
    name: 'Spinner',
    category: 'UI Components',
    moduleType: 'ui-spinner',
    description: 'Displays a spinner to indicate loading state.',
    children: (
      <div className="flex gap-4 items-center">
        <Spinner />
        <Spinner className="text-primary" />
        <Spinner size="lg" />
      </div>
    ),
  },
  {
    id: 'shadcn-switch',
    name: 'Switch',
    category: 'UI Components',
    moduleType: 'ui-switch',
    description: 'A control that allows the user to toggle between checked and not checked.',
    children: (
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
    ),
  },
  {
    id: 'shadcn-tabs',
    name: 'Tabs',
    category: 'UI Components',
    moduleType: 'ui-tabs',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
    children: (
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Pedro Duarte" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    ),
  },
  {
    id: 'shadcn-textarea',
    name: 'Textarea',
    category: 'UI Components',
    moduleType: 'ui-textarea',
    description: 'Displays a form textarea or a component that looks like a textarea.',
    children: (
      <div className="grid w-full gap-1.5">
        <Label htmlFor="message">Your message</Label>
        <Textarea placeholder="Type your message here." id="message" />
      </div>
    ),
  },
  {
    id: 'shadcn-toggle',
    name: 'Toggle',
    category: 'UI Components',
    moduleType: 'ui-toggle',
    description: 'A two-state button that can be either on or off.',
    children: (
      <div className="flex gap-2">
        <Toggle aria-label="Toggle italic">
          <Bell className="h-4 w-4" />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic">
          <Bell className="h-4 w-4" />
        </Toggle>
      </div>
    ),
  },
  {
    id: 'shadcn-toggle-group',
    name: 'Toggle Group',
    category: 'UI Components',
    moduleType: 'ui-toggle-group',
    description: 'A set of two-state buttons that can be toggled on or off.',
    children: (
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <Bell className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Settings className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline">
          <Calculator className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  {
    id: 'shadcn-tooltip',
    name: 'Tooltip',
    category: 'UI Components',
    moduleType: 'ui-tooltip',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    children: (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
];
