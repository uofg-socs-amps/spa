import {
  BarChart3,
  FileCheck2Icon,
  FilePlus2Icon,
  FileSpreadsheetIcon,
  FolderCheckIcon,
  FolderClockIcon,
  FolderHeartIcon,
  FolderIcon,
  FolderLockIcon,
  FolderOutputIcon,
  HomeIcon,
  LayersIcon,
  LibraryIcon,
  ListChecksIcon,
  MergeIcon,
  MousePointerSquareIcon,
  ServerIcon,
  SettingsIcon,
  ShuffleIcon,
  SplitIcon,
  SquareKanbanIcon,
  UserCog2,
  UserPlusIcon,
  Users2Icon,
} from "lucide-react";

export function Icon({ type }: { type: string }) {
  switch (type) {
    case "bar-chart":
      return <BarChart3 className="mr-2 h-4 w-4" />;

    case "file-check-2":
      return <FileCheck2Icon className="mr-2 h-4 w-4" />;

    case "file-plus-2":
      return <FilePlus2Icon className="mr-2 h-4 w-4" />;

    case "file-spreadsheet":
      return <FileSpreadsheetIcon className="mr-2 h-4 w-4" />;

    case "folder-check":
      return <FolderCheckIcon className="mr-2 h-4 w-4" />;

    case "folder-clock":
      return <FolderClockIcon className="mr-2 h-4 w-4" />;

    case "folder-heart":
      return <FolderHeartIcon className="mr-2 h-4 w-4" />;

    case "folder":
      return <FolderIcon className="mr-2 h-4 w-4" />;

    case "folder-lock":
      return <FolderLockIcon className="mr-2 h-4 w-4" />;

    case "folder-output":
      return <FolderOutputIcon className="mr-2 h-4 w-4" />;

    case "home":
      return <HomeIcon className="mr-2 h-4 w-4" />;

    case "layers":
      return <LayersIcon className="mr-2 h-4 w-4" />;

    case "library":
      return <LibraryIcon className="mr-2 h-4 w-4" />;

    case "list-checks":
      return <ListChecksIcon className="mr-2 h-4 w-4" />;

    case "merge":
      return <MergeIcon className="mr-2 h-4 w-4" />;

    case "mouse-pointer":
      return <MousePointerSquareIcon className="mr-2 h-4 w-4" />;

    case "server":
      return <ServerIcon className="mr-2 h-4 w-4" />;

    case "settings":
      return <SettingsIcon className="mr-2 h-4 w-4" />;

    case "shuffle":
      return <ShuffleIcon className="mr-2 h-4 w-4" />;

    case "split":
      return <SplitIcon className="mr-2 h-4 w-4" />;

    case "square-kanban":
      return <SquareKanbanIcon className="mr-2 h-4 w-4" />;

    case "user-cog":
      return <UserCog2 className="mr-2 h-4 w-4" />;

    case "user-plus":
      return <UserPlusIcon className="mr-2 h-4 w-4" />;

    case "users":
      return <Users2Icon className="mr-2 h-4 w-4" />;

    default:
      return null;
  }
}
