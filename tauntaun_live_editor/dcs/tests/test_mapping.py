import unittest
from dcs.mapping import Polygon, Point, Rectangle, Triangle


class PointTests(unittest.TestCase):
    def test_point(self):
        p1 = Point(2, 2)
        p2 = p1 + Point(1, 1)

        self.assertEqual(p2.x, 3)
        self.assertEqual(p2.y, 3)

        p2 = 1 + p1
        self.assertEqual(p2.x, 3)
        self.assertEqual(p2.y, 3)

        self.assertEqual(3 * p2, Point(9, 9))

        self.assertEqual(p2.x, 3)
        self.assertEqual(p2.y, 3)

        self.assertEqual(p2 * 0.5, Point(1.5, 1.5))

        p2 = p1 - 1
        self.assertEqual(p2.x, 1)
        self.assertEqual(p2.y, 1)

        p2 = p1 - p2
        self.assertEqual(p2.x, 1)
        self.assertEqual(p2.y, 1)


class RectangleTests(unittest.TestCase):
    def test_rectangle(self):
        r = Rectangle(0, 0, 10, 10)

        self.assertEqual(r.center(), Point(5, 5))

    def test_resize(self):
        r = Rectangle(0, 0, 10, 10)

        r2 = r.resize(0.5)
        self.assertEqual(r2, Rectangle(2.5, 2.5, 7.5, 7.5))

        r2 = r.resize(2)
        self.assertEqual(r2, Rectangle(-5, -5, 15, 15))

    def test_random_point(self):
        r = Rectangle(10, 0, 0, 10)

        for i in range(0, 100):
            rp = r.random_point()
            self.assertTrue(r.point_in_rect(rp))


class TriangleTests(unittest.TestCase):
    def test_triangle_random(self):
        t = Triangle((Point(0, 5), Point(1, 2), Point(3, 1)))
        self.assertIsNotNone(t)


class PolygonTests(unittest.TestCase):
    def test_poly_triangulation(self):
        points = [Point(1, 2),
                  Point(3, 1),
                  Point(7, 2),
                  Point(9, 4),
                  Point(6, 6),
                  Point(6, 9),
                  Point(4, 8),
                  Point(2, 9),
                  Point(1, 7),
                  Point(0, 5)]
        poly = Polygon(points)
        areas = [x.area() for x in poly.triangulate()]
        self.assertEqual(areas, [2.5, 9.5, 10.0, 7.5, 9.0, 1.0, 5.0, 0.0])

    def test_poly_random(self):
        points = [
            Point(1, 2),
            Point(3, 1),
            Point(7, 2),
            Point(9, 4),
            Point(6, 6),
            Point(6, 9),
            Point(4, 8),
            Point(2, 9),
            Point(1, 7),
            Point(0, 5)]
        poly = Polygon(points)

        for i in range(0, 100):
            rp = poly.random_point()
            self.assertTrue(poly.point_in_poly(rp))
