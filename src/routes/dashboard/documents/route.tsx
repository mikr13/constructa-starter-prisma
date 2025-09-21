import { createFileRoute } from '@tanstack/react-router'
import { FileText, Download, Trash2, Upload, Search, Eye, Filter } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useState } from 'react';
import { } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/documents')({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for documents
  const documents = [
    {
      id: 1,
      name: 'Business Plan 2024.pdf',
      type: 'PDF',
      size: '2.4 MB',
      modified: '2024-01-15',
      status: 'shared',
    },
    {
      id: 2,
      name: 'Financial Report Q4.xlsx',
      type: 'Spreadsheet',
      size: '1.2 MB',
      modified: '2024-01-10',
      status: 'private',
    },
    {
      id: 3,
      name: 'Project Proposal.docx',
      type: 'Document',
      size: '856 KB',
      modified: '2024-01-08',
      status: 'shared',
    },
    {
      id: 4,
      name: 'Marketing Analysis.pptx',
      type: 'Presentation',
      size: '5.7 MB',
      modified: '2024-01-05',
      status: 'private',
    },
    {
      id: 5,
      name: 'Contract Template.docx',
      type: 'Document',
      size: '234 KB',
      modified: '2024-01-03',
      status: 'shared',
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Spreadsheet':
        return 'bg-green-100 text-green-800';
      case 'Document':
        return 'bg-blue-100 text-blue-800';
      case 'Presentation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage and organize your documents in one place.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10.6 GB</div>
              <p className="text-xs text-muted-foreground">80% of 13 GB used</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">3 shared this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Documents</CardTitle>
                <CardDescription>A list of all your uploaded documents</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8 w-64"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{doc.modified}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'shared' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
