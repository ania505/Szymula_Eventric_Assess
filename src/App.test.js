import { render, screen } from "@testing-library/react";
import App2, { BirdList, BirdCard } from "./oneFile";

test("renders learn react link", () => {
  render(<App2 />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

const IMAGE = "https://images.unsplash.com/photo-1542252223-c7f5b1142f93";
const bird1 = {
  id: 5,
  name: "pidgey",
  images: [IMAGE],
};
const bird2 = {
  id: 1,
  name: "sparrow",
  images: [],
};
const bird3 = {
  id: 8,
  name: "golduck",
  images: [IMAGE, IMAGE],
};

describe("BirdCard tests", () => {
  const baseProps = {
    favorites: [2, 5, 8],
    setFavorites: jest.fn,
    bird: bird1,
  };

  it("should render bird", () => {
    const props = {
      favorites: [],
      setFavorites: jest.fn,
      bird: bird1,
    };
    render(<BirdCard {...props} />);
    const element = screen.getByText(/pidgey/i);
    expect(element).toBeInTheDocument();
  });
  it("should show add to favorites button when not in favorites", () => {
    const props = {
      ...baseProps,
      favorites: [2, 8],
    };
    render(<BirdCard {...props} />);
    const notFavEl = screen.getByText(/Click to Add to Favorites/i);
    expect(notFavEl).toBeInTheDocument();
  });
  it("should show favorite bird message when in favorites", () => {
    render(<BirdCard {...baseProps} />);
    const favEl = screen.getByText(/Favorite Bird!/i);
    expect(favEl).toBeInTheDocument();
  });
  it("should show image if bird has one", () => {
    render(<BirdCard {...baseProps} />);
    const favEl = screen.getByAltText("pidgey bird");
    expect(favEl).toBeInTheDocument();
  });
  it("should now show image if bird does not have one", () => {
    const props = {
      ...baseProps,
      bird: bird2,
    };
    render(<BirdCard {...props} />);
    const favEl = screen.getByAltText("pidgey bird");
    expect(favEl).not.toBeInTheDocument();
  });
});

describe("BirdList tests", () => {
  const props = {
    data: [bird1, bird2, bird3],
    favorites: [],
    showFavorites: jest.fn,
    itemsPerPage: 2,
  };

  it("should render only 2 items on first page", () => {
    render(<BirdList {...props} />);
    const b1 = screen.getByAltText("pidgey");
    expect(b1).toBeInTheDocument();
    const b2 = screen.getByAltText("sparrow");
    expect(b2).toBeInTheDocument();
    const b3 = screen.getByAltText("golduck");
    expect(b3).not.toBeInTheDocument();
  });
});

