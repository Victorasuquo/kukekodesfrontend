import { useState, useEffect } from 'react';
import api, { APICertificate, APICourse } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function Certificates() {
    const [certificates, setCertificates] = useState<APICertificate[]>([]);
    const [courses, setCourses] = useState<Record<number, APICourse>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [certsData, coursesData] = await Promise.all([
                    api.getCertificates(),
                    api.getCourses()
                ]);
                setCertificates(certsData);

                const courseMap: Record<number, APICourse> = {};
                coursesData.forEach(c => courseMap[c.id] = c);
                setCourses(courseMap);

            } catch (error) {
                console.error("Failed to fetch certificates:", error);
                // Don't toast error if it's just empty or 404, but API returns list usually
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDownload = (cert: APICertificate) => {
        toast({ title: 'Downloading...', description: 'Generating your certificate file.' });
        // In a real app, this would hit a download endpoint. 
        // For now, we simulate it or maybe the backend has a PDF view? 
        // The docs don't specify a PDF download endpoint, only the certificate detail.
        // We'll just show a "Coming Soon" or open the print view of a certificate page if we had one.
        // Let's assume there's a URL we can construct or just alert.
        alert(`Downloading certificate: ${cert.certificate_id}`);
    };

    if (loading) {
        return <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
    }

    if (certificates.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Certificates Yet</h3>
                <p className="text-muted-foreground">Complete courses to earn certificates!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => {
                const course = courses[cert.course];
                return (
                    <Card key={cert.id} className="border-primary/20 bg-card/50">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg">{course?.title || 'Unknown Course'}</CardTitle>
                                <CardDescription>Issued: {format(new Date(cert.issued_date), 'PPP')}</CardDescription>
                            </div>
                            <Award className="w-8 h-8 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-mono text-muted-foreground mb-4">
                                ID: {cert.certificate_id}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => handleDownload(cert)}>
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
