"use client";

// src/components/runs/run-rows-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckIcon,
  CircleIcon,
  InfoIcon,
  Loader2,
  MoreHorizontal,
  Phone,
  PhoneIcon,
  RefreshCw,
  SkipForwardIcon,
  User,
  XCircle,
  XIcon,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRun, useRunRows } from "@/hooks/use-runs";
import { formatPhoneDisplay } from "@/services/out/file/utils";
import Link from "next/link";

type RowStatus = "pending" | "calling" | "completed" | "failed" | "skipped";

interface Row {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  orgId: string;
  status: RowStatus;
  runId: string;
  patientId: string | null;
  variables: Record<string, unknown>;
  analysis: Record<string, unknown> | null;
  error: string | null;
  retellCallId: string | null;
  sortIndex: number;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  } | null;
}

interface RunRowsTableProps {
  runId: string;
}

export function RunRowsTable({ runId }: RunRowsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Use the useRun hook to get run details
  const { run: runData } = useRun(runId);

  // Get campaign variables from the run's campaign
  const campaignVariables =
    runData?.campaign?.config?.variables?.campaign?.fields || [];

  // Get campaign analysis fields and find the main KPI
  const campaignAnalysisFields =
    runData?.campaign?.config?.analysis?.campaign?.fields || [];
  const mainKpiField = campaignAnalysisFields.find((field) => field.isMainKPI);

  // Use the useRunRows hook for better real-time updates
  const {
    rows,
    pagination: paginationData,
    counts,
    isLoading,
    refetch,
    pageOptions: { pagination, setPagination },
    filterOptions: { filter, setFilter },
  } = useRunRows(runId);

  // Define base columns
  const baseColumns: ColumnDef<Row>[] = [
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original.patient;
        const variables = row.original.variables || {};

        // Extract patient data from either the patient object or variables
        const firstName = patient?.firstName || variables.firstName || "";
        const lastName = patient?.lastName || variables.lastName || "";
        const phoneNumber =
          patient?.phoneNumber ||
          variables.primaryPhone ||
          variables.phoneNumber ||
          variables.phone ||
          "No phone";

        const name =
          firstName && lastName ? `${firstName} ${lastName}` : "Unknown";

        const initials =
          firstName && lastName
            ? `${String(firstName).charAt(0)}${String(lastName).charAt(0)}`
            : "?";

        // Format the phone number for display
        const formattedPhone = phoneNumber
          ? formatPhoneDisplay(String(phoneNumber))
          : "No phone";

        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex cursor-pointer items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formattedPhone}
                  </div>
                </div>
                <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Patient Details</h4>
                  <div className="text-sm text-muted-foreground">
                    Complete information about this patient.
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Name</span>
                    <span className="col-span-2 text-sm">{name}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">Phone</span>
                    <span className="col-span-2 text-sm">{formattedPhone}</span>
                  </div>
                  {variables.dob && (
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">DOB</span>
                      <span className="col-span-2 text-sm">
                        {String(variables.dob)}
                      </span>
                    </div>
                  )}
                  {variables.email && (
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Email</span>
                      <span className="col-span-2 text-sm">
                        {String(variables.email)}
                      </span>
                    </div>
                  )}
                  {patient?.id && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/patients/${patient.id}`}>
                          <User className="mr-2 h-4 w-4" />
                          View Patient Profile
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let label = "Unknown";
        let variant:
          | "default"
          | "destructive"
          | "outline"
          | "secondary"
          | "success_outline"
          | "success_solid" = "default";
        let icon = <CircleIcon className="h-3 w-3" />;

        if (status === "pending") {
          label = "Pending";
          variant = "outline";
          icon = <CircleIcon className="h-3 w-3" />;
        } else if (status === "calling") {
          label = "Calling";
          variant = "secondary";
          icon = <PhoneIcon className="h-3 w-3" />;
        } else if (status === "completed") {
          label = "Completed";
          variant = "success_solid";
          icon = <CheckIcon className="h-3 w-3" />;
        } else if (status === "failed") {
          label = "Failed";
          variant = "destructive";
          icon = <XIcon className="h-3 w-3" />;
        } else if (status === "skipped") {
          label = "Skipped";
          variant = "outline";
          icon = <SkipForwardIcon className="h-3 w-3" />;
        }

        return (
          <Badge variant={variant} className="flex w-fit items-center gap-1.5">
            {icon}
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "campaignVariables",
      header: "Campaign Data",
      cell: ({ row }) => {
        const variables = row.original.variables || {};

        // Filter out patient-related variables
        const patientKeys = [
          "firstName",
          "lastName",
          "phoneNumber",
          "primaryPhone",
          "emrId",
          "phone",
          "dob",
          "email",
        ];
        const campaignVars = Object.entries(variables).filter(
          ([key]) => !patientKeys.includes(key),
        );

        if (campaignVars.length === 0) {
          return <span className="text-muted-foreground">No data</span>;
        }

        // Get a preview of the first few variables
        const previewVars = campaignVars.slice(0, 2);
        const hasMore = campaignVars.length > 2;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex cursor-pointer items-center gap-2">
                <div>
                  {previewVars.map(([key, value]) => {
                    // Find the variable definition to get the label
                    const varDef = campaignVariables.find((v) => v.key === key);
                    const label = varDef?.label || key;

                    return (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{label}:</span>{" "}
                        <span>{String(value)}</span>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <div className="text-xs text-muted-foreground">
                      + {campaignVars.length - 2} more fields
                    </div>
                  )}
                </div>
                <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Campaign Data</h4>
                  <div className="text-sm text-muted-foreground">
                    Campaign-specific variables for this row.
                  </div>
                </div>
                <div className="grid gap-2">
                  {campaignVars.map(([key, value]) => {
                    // Find the variable definition to get the label
                    const varDef = campaignVariables.find((v) => v.key === key);
                    const label = varDef?.label || key;

                    return (
                      <div
                        key={key}
                        className="grid grid-cols-3 items-center gap-4"
                      >
                        <span className="text-sm font-medium">{label}</span>
                        <span className="col-span-2 text-sm">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  // Add main KPI column if it exists
  if (mainKpiField) {
    baseColumns.push({
      accessorKey: "mainKpi",
      header: mainKpiField.label,
      cell: ({ row }) => {
        const analysis = row.original.analysis || {};
        const status = row.getValue("status") as RowStatus;

        if (status === "pending" || status === "calling") {
          return <span className="text-muted-foreground">Waiting...</span>;
        }

        if (status === "failed") {
          return <span className="text-muted-foreground">Failed</span>;
        }

        if (!analysis) {
          return <span className="text-muted-foreground">No data</span>;
        }

        // Get the value from the analysis data
        const value = analysis[mainKpiField.key];

        if (value === undefined) {
          return <span>-</span>;
        }

        // Format the value based on type
        if (
          typeof value === "boolean" ||
          value === "true" ||
          value === "false"
        ) {
          const isPositive = value === true || value === "true";
          return (
            <Badge variant={isPositive ? "success_solid" : "neutral_solid"}>
              {isPositive ? "Yes" : "No"}
            </Badge>
          );
        }

        return <span>{String(value)}</span>;
      },
    });
  } else {
    // Fallback to scheduled column if no main KPI exists
    baseColumns.push({
      accessorKey: "scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => {
        const date = row.original.variables?.scheduledDate;
        const time = row.original.variables?.scheduledTime;

        return (
          <div>
            <div className="font-medium">
              {date ? String(date) : "Not scheduled"}
            </div>
            {time != null && time !== "" && (
              <div className="text-xs text-muted-foreground">
                {String(time)}
              </div>
            )}
          </div>
        );
      },
    });
  }

  // Create outcome and actions columns
  const outcomeAndActionsColumns: ColumnDef<Row>[] = [
    {
      id: "outcome",
      header: "Call Outcome",
      cell: ({ row }) => {
        const analysis = row.original.analysis;
        const status = row.getValue("status") as RowStatus;

        if (status === "pending" || status === "calling") {
          return <span className="text-muted-foreground">Waiting...</span>;
        }

        if (status === "failed") {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-red-500">
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Error
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <h4 className="font-medium">Error Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {row.original.error || "Unknown error"}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          );
        }

        if (!analysis) {
          return <span className="text-muted-foreground">No data</span>;
        }

        // Try to find the main KPI in post call data
        let outcome = "Unknown";

        // Common post-call fields to check
        const fieldsToCheck = [
          "appointment_confirmed",
          "appointmentConfirmed",
          "patient_reached",
          "patientReached",
        ];

        for (const field of fieldsToCheck) {
          if (field in analysis) {
            const value = analysis[field];
            outcome =
              typeof value === "boolean"
                ? value
                  ? "Yes"
                  : "No"
                : String(value);
            break;
          }
        }

        return <span className="font-medium">{outcome}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            {row.original.patientId && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/patients/${row.original.patientId}`}>
                  <User className="h-4 w-4" />
                  <span className="sr-only">View Patient</span>
                </Link>
              </Button>
            )}

            {row.original.retellCallId && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/calls?callId=${row.original.retellCallId}`}>
                  <Phone className="h-4 w-4" />
                  <span className="sr-only">View Call</span>
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </div>
        );
      },
    },
  ];

  // Combine all columns
  const columns: ColumnDef<Row>[] = [
    ...baseColumns,
    ...outcomeAndActionsColumns,
  ];

  // Create a table instance
  const table = useReactTable({
    data: rows,
    columns: baseColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: paginationData?.totalPages || 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2"
            onClick={() => {
              void refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={filter || "all"}
            onValueChange={(value) =>
              setFilter(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="calling">Calling</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={baseColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={baseColumns.length}
                  className="h-24 text-center"
                >
                  No rows found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginationData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {rows.length} of {paginationData.totalItems} rows
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  setPagination({
                    ...pagination,
                    pageIndex: 0,
                    pageSize: Number(value),
                  });
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPagination({
                    ...pagination,
                    pageIndex: Math.max(0, pagination.pageIndex - 1),
                  });
                }}
                disabled={pagination.pageIndex === 0}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {pagination.pageIndex + 1} of{" "}
                {paginationData.totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPagination({
                    ...pagination,
                    pageIndex: Math.min(
                      paginationData.totalPages - 1,
                      pagination.pageIndex + 1,
                    ),
                  });
                }}
                disabled={
                  pagination.pageIndex === paginationData.totalPages - 1 ||
                  paginationData.totalPages === 0
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
