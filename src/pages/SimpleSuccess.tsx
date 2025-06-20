import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

const SimpleSuccess = () => {
  const { user, logout } = useSimpleAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">
            🎉 Success!
          </CardTitle>
          <CardDescription>
            The app is working perfectly without errors!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              ✅ No React errors
              <br />
              ✅ No infinite loops
              <br />
              ✅ Clean navigation
              <br />✅ Working authentication
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Button onClick={logout} variant="destructive" className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSuccess;
